import Navbar from './Navbar';
import Footer from './Footer';

/**
 * MainLayout - Standard page layout with Navbar and Footer
 * Use this for all public-facing pages
 */
export default function MainLayout({ children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 font-[Inter] min-h-screen transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
