const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="w-full bg-white dark:bg-gray-800 py-4 mt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 md:mb-0">
                        © {currentYear} Döviz Takip. Tüm hakları saklıdır.
                    </div>
                    <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <a href="#" className="hover:text-blue-500 transition-colors">
                            Gizlilik Politikası
                        </a>
                        <a href="#" className="hover:text-blue-500 transition-colors">
                            Kullanım Şartları
                        </a>
                        <a href="#" className="hover:text-blue-500 transition-colors">
                            İletişim
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;