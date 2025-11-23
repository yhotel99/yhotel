export interface Category {
  value: string;
  label: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/api/rooms/categories', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to default categories (matching database schema)
    return [
      { value: 'all', label: 'Tất cả' },
      { value: 'standard', label: 'Standard' },
      { value: 'family', label: 'Family' },
      { value: 'superior', label: 'Superior' },
      { value: 'deluxe', label: 'Deluxe' },
    ];
  }
}

