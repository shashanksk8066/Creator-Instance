import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...', fullScreen = false }: { text?: string, fullScreen?: boolean }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3 p-8 text-gray-500">
      <Loader2 size={32} className="animate-spin text-blue-600" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
};

export const TableLoader = ({ colSpan = 5, text = 'Loading...' }: { colSpan?: number, text?: string }) => (
  <tr>
    <td colSpan={colSpan} className="p-8">
      <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <span className="text-sm font-medium">{text}</span>
      </div>
    </td>
  </tr>
);
