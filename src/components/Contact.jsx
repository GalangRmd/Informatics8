import { motion } from 'framer-motion'

const Contact = () => {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-10 bg-black text-white relative z-10" id="contact">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-2xl"
            >
                <h2 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    Follow Our Journey
                </h2>
                <p className="text-xl text-gray-400 mb-12">
                    Catch up with our latest moments, events, and class activities. Follow our official Instagram account!
                </p>

                <a
                    href="https://www.instagram.com/informatics_08/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Follow @informatics_08
                </a>
            </motion.div>

            <footer className="absolute bottom-10 text-gray-600 text-sm">
                © {new Date().getFullYear()} Informatics 8 Class of 2025. All rights reserved.
            </footer>
        </section>
    )
}

export default Contact
