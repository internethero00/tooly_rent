export class CategoryEntity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
