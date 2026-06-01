import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]}`}
    >
      {icon && (
        <span className={styles.icon}>
          {icon}
        </span>
      )}

      <span>{children}</span>
    </button>
  );
}