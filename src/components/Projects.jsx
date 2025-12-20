import { motion } from 'framer-motion'

const projects = [
    {
        title: "E-Commerce Reform",
        category: "Fullstack",
        description: "A complete overhaul of a legacy e-commerce platform using Next.js and Microservices."
    },
    {
        title: "Neon Dashboard",
        category: "Frontend",
        description: "A high-performance analytics dashboard with real-time data visualization."
    },
    {
        title: "AI Chat Interface",
        category: "AI Integration",
        description: "An intuitive interface for interacting with LLMs, featuring streaming responses."
    }
]

const Projects = () => {
    return (
        <section className="min-h-screen py-20 px-10 bg-gradient-to-b from-black to-gray-900 text-white relative z-10" id="projects">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl font-bold text-center mb-16"
            >
                Selected Works
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                    >
                        <div className="h-48 bg-gray-700 group-hover:bg-gray-600 transition-colors"></div>
                        <div className="p-6">
                            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">{project.category}</span>
                            <h3 className="text-2xl font-bold mt-2 mb-3 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                            <p className="text-gray-400 text-sm">{project.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}

export default Projects
