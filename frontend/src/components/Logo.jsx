import logoImage from '../assets/images/logo.png';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="LifeLink Logo" 
        className={`${sizeClasses[size]} object-contain ${showText ? 'mr-3' : ''}`}
        onError={(e) => {
          // Fallback to heart icon if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback heart icon */}
      <div className={`${sizeClasses[size]} bg-red-500 rounded-lg items-center justify-center ${showText ? 'mr-3' : ''} hidden`}>
        <span className="text-white text-xl">❤️</span>
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizes[size]}`}>
          LifeLink
        </span>
      )}
    </div>
  );
};

export default Logo;