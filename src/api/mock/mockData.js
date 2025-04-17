export const mockNotes = [
  {
    id: 1,
    name: '첫 번째 노트',
    createdAt: '2024-04-17T10:00:00Z',
    updatedAt: '2024-04-17T10:00:00Z',
  },
  {
    id: 2,
    name: '두 번째 노트',
    createdAt: '2024-04-17T11:00:00Z',
    updatedAt: '2024-04-17T11:00:00Z',
  },
  {
    id: 3,
    name: '세 번째 노트',
    createdAt: '2024-04-17T12:00:00Z',
    updatedAt: '2024-04-17T12:00:00Z',
  },
];

export const mockFiles = {
  1: [
    {
      id: 1,
      name: 'document1.pdf',
      size: 1024,
      uploadedAt: '2024-04-17T10:30:00Z',
    },
  ],
  2: [
    {
      id: 2,
      name: 'document2.pdf',
      size: 2048,
      uploadedAt: '2024-04-17T11:30:00Z',
    },
  ],
};

export const mockMessages = {
  1: [
    {
      id: 1,
      text: '안녕하세요!',
      sender: 'user',
      timestamp: '2024-04-17T10:05:00Z',
    },
    {
      id: 2,
      text: '안녕하세요! 어떻게 도와드릴까요?',
      sender: 'assistant',
      timestamp: '2024-04-17T10:05:30Z',
    },
  ],
  2: [
    {
      id: 3,
      text: '이 문서에 대해 설명해주세요.',
      sender: 'user',
      timestamp: '2024-04-17T11:05:00Z',
    },
  ],
}; 