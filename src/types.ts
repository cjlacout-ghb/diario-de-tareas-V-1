export interface Task {
  id: string;
  text: string;
  url?: string;
  completed: boolean;
  createdAt: number;
}

export type NewTaskInput = {
  text: string;
  url: string;
};

export type TabType = 'daily' | 'monthly';
