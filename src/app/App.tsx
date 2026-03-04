import { RouterProvider } from 'react-router';
import { router } from './routes';

function App() {
  return (
    <div className="dark min-h-screen">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
