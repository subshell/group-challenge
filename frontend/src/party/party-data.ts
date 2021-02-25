export interface Party {
  id: string;
  name: string;
  description: string;
  category: 'photo';
  startDate: Date;
  endDate: Date;
  items: PartyItem[];
}

export interface PartyItem {
  id: string;
  name?: string;
  url: string;
}
