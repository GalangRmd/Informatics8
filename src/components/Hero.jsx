import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Hero = () => {
    const { isAdmin } = useAuth();
    return (
        <section className="h-screen w-full relative bg-gray-900 overflow-hidden flex items-center justify-center" id="hero">
            {/* Dashboard Button for Admin */}
            {isAdmin && (
                <div className="absolute top-6 right-6 z-50">
                    <Link to="/admin-dashboard">
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 bg-purple-600/20 text-purple-300 rounded-full font-bold hover:bg-purple-600/30 transition-colors border border-purple-500/30 backdrop-blur-md flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                        </motion.button>
                    </Link>
                </div>
            )}

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/IMG_2618.JPG')" }}
                ></div>
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/70"></div>
            </div>

            <div className="z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter glossy-text hero-title">
                    Informatics 8
                </h1>
            </div>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-none">
                <p className="text-gray-400 text-sm animate-bounce">Scroll Down</p>
            </div>
        </section>
    )
}

export default Hero
