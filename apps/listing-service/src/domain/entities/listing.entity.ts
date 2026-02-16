import { Decimal } from '../../generated/prisma/internal/prismaNamespace';

export class ListingEntity {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  images: Image[];
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    title: string;
    description: string;
    pricePerDay: number | Decimal;
    images?: Image[];
    categories?: Category[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.pricePerDay = Number(data.pricePerDay);
    this.images = data.images ?? [];
    this.categories = data.categories ?? [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export interface Category {
  id: string;
  name: string;
}

export interface Image {
  id: string;
  url: string;
  toolId: string;
}
