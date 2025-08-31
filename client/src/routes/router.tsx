// // src/routes/route.tsx
// //注意：一定是.tsx文件，不能是.js文件

import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/Layout/Layout';
import StudyNotes from '../pages/StudyNotes';
import QuestionBank from '../pages/QuestionBank';
import AIGeneration from '../pages/AIGeneration';
import ErrorPage from '../pages/ErrorPage';
import ExamGeneration from '../pages/ExamGeneration';
import ExamManagement from '../pages/ExamManagement';

const questionLoader = async () => {
  return ['选择题一', '选择题二', '编程题'];
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <StudyNotes />,
      },
      {
        path: 'notes',
        element: <StudyNotes />,
      },
      {
        path: 'questions',
        element: <QuestionBank />,
        loader: questionLoader,
        children: [
          {
            path: 'ai-generation',
            element: (
              <AIGeneration onCancel={() => {}} onSaveSuccess={() => {}} />
            ),
          },
        ],
      },
      {
        path: 'exam-generation',
        element: <ExamGeneration />,
      },
      {
        path: 'exam-management',
        element: <ExamManagement />,
      },
    ],
  },
]);

export default router;
