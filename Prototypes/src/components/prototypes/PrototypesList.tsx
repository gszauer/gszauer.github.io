import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CategoryItem } from '../../types/windows98';

interface PrototypesListProps {
  items: CategoryItem[];
}

const PrototypesList: React.FC<PrototypesListProps> = ({ items }) => {
  return (
    <div className="win98-folder-content p-4">
      <h2 className="text-lg font-bold mb-4">Prototypes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item) => (
          <div 
            key={item.id} 
            className="win98-window border cursor-pointer p-2"
          >
            <div className="mb-2">
              {item.thumbnail && (
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-32 object-cover"
                />
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-gray-700">{item.description}</p>
              </div>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="win98-button p-1 ml-2 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {(!items || items.length === 0) && (
        <div className="text-center py-16 text-gray-500">
          <p>No prototypes available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default PrototypesList;