import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  currentPage: string;
}

export default function Breadcrumb({ currentPage }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb mb-0 flex items-center gap-2 text-sm">
        <li className="breadcrumb-item">
          <Link 
            to="/dashboard" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <i className="fi fi-rr-home text-xs"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className="breadcrumb-item text-gray-400 dark:text-gray-500">/</li>
        <li className="breadcrumb-item active text-gray-500 dark:text-gray-400" aria-current="page">
          {currentPage}
        </li>
      </ol>
    </nav>
  );
}

