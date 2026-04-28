import { Wrench, Users, ImageIcon } from "lucide-react";
import { memo } from "react";

const ImageFallback = memo(({ 
  type = "generic", 
  className = "",
  alt = ""
}) => {
  // Background configurations based on type
  const backgrounds = {
    service: "bg-gradient-to-br from-brand-lightblue/20 to-brand-blue/20",
    team: "bg-gradient-to-br from-brand-green/20 to-brand-lightblue/20",
    generic: "bg-slate-100",
  };

  // Icon configurations based on type
  const icons = {
    service: <Wrench className="w-12 h-12 text-brand-blue/40" />,
    team: <Users className="w-12 h-12 text-brand-green/40" />,
    generic: <ImageIcon className="w-12 h-12 text-slate-300" />,
  };

  // Label text based on type
  const labels = {
    service: "Service image",
    team: "Team photo",
    generic: "Image",
  };

  return (
    <div 
      className={`aspect-video flex flex-col items-center justify-center rounded-2xl ${backgrounds[type] || backgrounds.generic} ${className}`}
      role="img"
      aria-label={alt || labels[type]}
    >
      {icons[type] || icons.generic}
      <span className="mt-2 text-sm text-slate-400">
        {labels[type]}
      </span>
    </div>
  );
});

ImageFallback.displayName = "ImageFallback";

export default ImageFallback;
