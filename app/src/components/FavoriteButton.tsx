import { Star } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

interface FavoriteButtonProps {
    id: string;
    type: 'stock' | 'crypto';
    className?: string;
}

export function FavoriteButton({ id, type, className = '' }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(id, type);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        await toggleFavorite(id, type);
    };

    return (
        <button
            onClick={handleClick}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all hover:scale-110 active:scale-95 ${className}`}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Star
                size={20}
                className={`transition-all ${favorited
                        ? 'fill-amber-400 text-amber-400 drop-shadow-lg'
                        : 'text-gray-400 hover:text-amber-400'
                    }`}
            />
        </button>
    );
}
