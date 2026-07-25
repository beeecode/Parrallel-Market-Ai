import { createBrowserRouter } from 'react-router-dom';

import { ArchitectureReadyPage } from '@/pages/ArchitectureReadyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ArchitectureReadyPage />,
  },
]);
