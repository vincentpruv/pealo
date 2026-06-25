export function GradientStar({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className={className}>
      <defs>
        <linearGradient id="starGradient-common" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd119"></stop>
          <stop offset="25%" stopColor="#facc15"></stop>
          <stop offset="40%" stopColor="#ffeb9d"></stop>
          <stop offset="55%" stopColor="#facc15"></stop>
          <stop offset="100%" stopColor="#e6ae08"></stop>
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
        clipRule="evenodd"
        fill="url(#starGradient-common)"
      ></path>
    </svg>
  );
}
