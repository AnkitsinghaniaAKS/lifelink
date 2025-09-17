const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
      hover ? 'transition-all duration-200 hover:shadow-md hover:border-gray-200' : ''
    } ${className}`}>
      {children}
    </div>
  );
};

export default Card;