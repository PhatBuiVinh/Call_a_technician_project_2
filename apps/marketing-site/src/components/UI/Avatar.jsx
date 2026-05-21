import { memo } from "react";

const Avatar = memo(({ name, size = "md", className = "" }) => {
  // Extract initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Size configurations
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-2xl",
  };

  // Brand color palette for consistent coloring based on name
  const colors = [
    "bg-brand-navy",
    "bg-brand-blue",
    "bg-brand-lightblue",
    "bg-brand-green",
  ];

  // Consistent color based on first character of name
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`${sizes[size] || sizes.md} ${
        colors[colorIndex]
      } rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;
