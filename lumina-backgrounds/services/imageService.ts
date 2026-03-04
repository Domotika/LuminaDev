import { Photo, ImageSource } from '../types';

interface LocalPhoto extends Photo {
    tags: string[];
}

export interface AnimatedBackground {
  id: string;
  url: string;
  title: string;
  icon: string;
}

// Animated Backgrounds (GIFs) - exported for settings UI
export const ANIMATED_BACKGROUNDS: AnimatedBackground[] = [
  { id: 'cyber-mist', url: 'https://i.ibb.co/JW5L4ntV/Cyber-Mist.gif', title: 'Cyber Mist', icon: '🌫️' },
  { id: 'aurora', url: 'https://i.ibb.co/FbqRJsqC/aurora.gif', title: 'Aurora', icon: '🌌' },
  { id: 'nebula', url: 'https://i.ibb.co/kVQJTqP7/gif-nebula.gif', title: 'Nebula', icon: '🔮' },
  { id: 'grid', url: 'https://i.ibb.co/1GXRdFrt/grid.gif', title: 'Grid', icon: '📐' },
  { id: 'matrix', url: 'https://i.ibb.co/NnnPRhzH/matrix-3.gif', title: 'Matrix', icon: '💚' },
  { id: 'zen', url: 'https://i.ibb.co/r2nffQF8/Zen-2.gif', title: 'Zen', icon: '🧘' },
  { id: 'pulse', url: 'https://i.ibb.co/nJKDdb7/pulse-2.gif', title: 'Pulse', icon: '💓' },
  { id: 'polygons', url: 'https://i.ibb.co/sJCBmmTZ/polygons.gif', title: 'Polygons', icon: '🔷' },
  { id: 'golden', url: 'https://i.ibb.co/5xfXS1gj/golden-2.gif', title: 'Golden', icon: '✨' },
  { id: 'ocean', url: 'https://i.ibb.co/DP3PWBL0/ocean-3.gif', title: 'Ocean', icon: '🌊' },
];

// Convert to LocalPhoto format for internal use
const ANIMATED_PHOTOS: LocalPhoto[] = ANIMATED_BACKGROUNDS.map(bg => ({
  url: bg.url,
  author: 'Lumina',
  title: bg.title,
  tags: ['animated', bg.id]
}));

// Highly reliable, high-quality Unsplash Image IDs
const CURATED_COLLECTION: LocalPhoto[] = [
  // --- NATUREZA ---
  { 
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80', 
    author: 'Vadim Sherbakov', 
    title: 'Foggy Forest', 
    tags: ['nature', 'natureza', 'floresta'] 
  },
  { 
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80', 
    author: 'Lukasz Szmigiel', 
    title: 'Forest Sunlight', 
    tags: ['nature', 'natureza', 'floresta'] 
  },
  { 
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80', 
    author: 'Patrick Hendry', 
    title: 'Mountains', 
    tags: ['nature', 'natureza', 'montanha'] 
  },
  { 
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', 
    author: 'Sean Oulashin', 
    title: 'Beach Sunset', 
    tags: ['nature', 'natureza', 'praia'] 
  },
  // --- ARQUITETURA ---
  { 
    url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80', 
    author: 'Simone Hutsch', 
    title: 'Blue Facade', 
    tags: ['architecture', 'arquitetura', 'moderno'] 
  },
  { 
    url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1920&q=80', 
    author: 'Dmitry Vechorko', 
    title: 'Interior Hall', 
    tags: ['architecture', 'arquitetura', 'interior'] 
  },
  // --- MUSICA ---
  { 
    url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920&q=80', 
    author: 'Lee Campbell', 
    title: 'Headphones', 
    tags: ['music', 'musica', 'audio'] 
  },
  { 
    url: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&w=1920&q=80', 
    author: 'Adrian Korte', 
    title: 'Vinyl', 
    tags: ['music', 'musica', 'vinil'] 
  }
];

export const fetchPhotos = async (
  source: ImageSource, 
  customUrls: string = '', 
  tags: string = '',
  animatedBgId?: string
): Promise<Photo[]> => {
  
  // 1. Handle Animated Backgrounds
  if (source === 'animated') {
    // If a specific background is selected, return only that one
    if (animatedBgId && animatedBgId !== 'all') {
      const selected = ANIMATED_BACKGROUNDS.find(bg => bg.id === animatedBgId);
      if (selected) {
        return [{ url: selected.url, author: 'Lumina', title: selected.title }];
      }
    }
    // Return all animated backgrounds in rotation
    return shuffle([...ANIMATED_PHOTOS]);
  }

  // 2. Handle Custom URLs
  if (source === 'custom') {
    const urls = customUrls
      .split(/[\n,]+/) // Split by newlines or commas
      .map(u => u.trim())
      .filter(u => u.length > 0 && u.startsWith('http'));

    if (urls.length > 0) {
      return urls.map(url => ({
        url: url,
        author: 'Minha Galeria',
        title: 'Imagem Personalizada'
      }));
    }
    // If user selected custom but provided no valid URLs, fallback to collection
    console.warn("Source is custom but no URLs provided. Using fallback.");
  }

  // 2. Handle Unsplash Collection
  if (!tags.trim()) {
    return shuffle([...CURATED_COLLECTION]);
  }

  const searchTags = tags.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);

  // Filter images that match AT LEAST one tag
  const filtered = CURATED_COLLECTION.filter(photo => 
    photo.tags.some(tag => 
        searchTags.some(search => tag.includes(search) || search.includes(tag))
    )
  );

  // If filter finds nothing, return all to avoid black screen
  if (filtered.length === 0) {
      return shuffle([...CURATED_COLLECTION]);
  }

  return shuffle(filtered);
};

function shuffle(array: any[]) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
