from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
from transformers import pipeline, CLIPProcessor, CLIPModel
import torch
import io
import requests
import json
from typing import List

app = FastAPI()

classifier = pipeline(
    task="zero-shot-image-classification",
    model="openai/clip-vit-base-patch32"
)

clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

CANDIDATE_LABELS = [
    "oil filter",
    "round black oil filter",
    "air filter",
    "rectangular air filter",
    "fuel filter",
    "brake pad",
    "brake disc",
    "car battery",
    "spark plug",
    "car tire",
    "motorcycle tire",
    "headlight",
    "tail light",
    "shock absorber",
    "engine belt",
    "radiator",
    "clutch disc",
    "car mirror",
    "wiper blade"
]

LABELS_FR = {
    "oil filter": "filtre huile",
    "round black oil filter": "filtre huile rond noir",
    "air filter": "filtre air",
    "rectangular air filter": "filtre air rectangulaire",
    "fuel filter": "filtre carburant",
    "brake pad": "plaquette frein",
    "brake disc": "disque frein",
    "car battery": "batterie voiture",
    "spark plug": "bougie allumage",
    "car tire": "pneu voiture",
    "motorcycle tire": "pneu moto",
    "headlight": "phare avant",
    "tail light": "feu arrière",
    "shock absorber": "amortisseur",
    "engine belt": "courroie moteur",
    "radiator": "radiateur",
    "clutch disc": "disque embrayage",
    "car mirror": "rétroviseur",
    "wiper blade": "essuie glace"
}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    results = classifier(
        pil_image,
        candidate_labels=CANDIDATE_LABELS
    )

    top_results = results[:5]

    detected_labels = []
    detected_keywords = []

    for item in top_results:
        label_en = item["label"]
        score = float(item["score"])

        label_fr = LABELS_FR.get(label_en, label_en)

        detected_labels.append({
            "labelEn": label_en,
            "labelFr": label_fr,
            "score": score
        })

        if score >= 0.10:
            detected_keywords.append(label_fr)

    keyword = " ".join(detected_keywords)

    return {
        "keyword": keyword,
        "labels": detected_labels
    }


def image_to_embedding(pil_image: Image.Image):
    inputs = clip_processor(
        images=pil_image,
        return_tensors="pt"
    )

    with torch.no_grad():
        image_features = clip_model.get_image_features(**inputs)

    image_features = image_features / image_features.norm(dim=-1, keepdim=True)

    return image_features[0]


def load_image_from_url(url: str):
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    return Image.open(io.BytesIO(response.content)).convert("RGB")


def load_image_from_bytes(image_bytes: bytes):
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


@app.post("/similarity")
async def image_similarity(
    image: UploadFile = File(...),
    productsJson: str = Form(...)
):
    image_bytes = await image.read()
    query_image = load_image_from_bytes(image_bytes)
    query_embedding = image_to_embedding(query_image)

    products = json.loads(productsJson)

    results = []

    for product in products:
        product_id = product.get("id")
        image_url = product.get("imageUrl")

        if not product_id or not image_url:
            continue

        try:
            product_image = load_image_from_url(image_url)
            product_embedding = image_to_embedding(product_image)

            similarity = torch.nn.functional.cosine_similarity(
                query_embedding,
                product_embedding,
                dim=0
            ).item()

            results.append({
                "productId": product_id,
                "score": float(similarity)
            })

        except Exception:
            continue

    results = sorted(
        results,
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "results": results[:10]
    }
def embedding_to_list(embedding):
    return embedding.detach().cpu().numpy().tolist()

@app.post("/embedding")
async def create_embedding(image: UploadFile = File(...)):
    image_bytes = await image.read()
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    embedding = image_to_embedding(pil_image)

    return {
        "embedding": embedding_to_list(embedding)
    }
