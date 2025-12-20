import Hero from '../components/Hero'
import About from '../components/About'
import Members from '../components/Members'
import Contact from '../components/Contact'

function Home() {
    return (
        <div className="bg-black min-h-screen text-white">
            <Hero />
            <About />
            <Members />
            <Contact />
        </div>
    )
}

export default Home
