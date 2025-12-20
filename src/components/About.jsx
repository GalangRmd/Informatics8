import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const About = () => {
    return (
        <section className="min-h-screen flex items-center justify-center p-10 relative overflow-hidden" id="about">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gray-950">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-900/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-900/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="backdrop-blur-sm bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 max-w-max">
                        About Us
                    </h2>
                    <p className="text-xl text-gray-200 leading-relaxed mb-6 font-light">
                        We are <span className="text-blue-400 font-bold tracking-wide">Informatics 8</span>, Class of 2025 from <span className="text-purple-400 font-bold">Universitas Komputer Indonesia</span>.
                    </p>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        A collective of passionate future innovators, developers, and problem solvers. Together, we navigate the world of code, data, and algorithms to shape the future of technology.
                    </p>

                    {/* Decorative line */}
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mt-8 rounded-full"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    viewport={{ once: true }}
                    className="relative group cursor-pointer"
                >
                    <Link to="/gallery">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative pb-[100%] rounded-2xl overflow-hidden shadow-2xl bg-gray-900 ring-1 ring-white/10">
                            <img
                                src="/IMG_2618.JPG"
                                alt="Informatics 8 Class of 2025"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white bg-black/50 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    View Gallery
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default About
