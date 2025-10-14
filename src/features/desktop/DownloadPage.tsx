import { DownloadButtons } from '.';
import { RevealUp } from '../../components/motion/Reveal';

export default function DownloadPage() {
    return (
        <section className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
            <div className="max-w-2xl mx-auto">

                <RevealUp distance={8}>
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-6 tracking-wide font-system">Download the App</h1>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-xl mx-auto">
                            Get the latest version of our application for your OS.
                        </p>
                    </div>
                </RevealUp>


                <RevealUp distance={6}>
                    <div className="ultra-premium-glass-card rounded-2xl p-8">
                        <DownloadButtons />
                        <div className="mt-8 text-center">
                            <a
                                href="/connect"
                                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Already have the app? Connect your wallet
                            </a>
                        </div>
                    </div>
                </RevealUp>

                <RevealUp distance={4}>
                    <footer className="mt-12 text-center text-sm text-text-muted">
                        <p>If you have any questions, please check our <a href="https://clones.gitbook.io/clones.docs" target="_blank" rel="noopener noreferrer" className="footer-link">docs</a></p>
                    </footer>
                </RevealUp>
            </div>
        </section>
    );
}