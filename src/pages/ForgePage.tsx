import { ForgeHero } from '../components/forge/ForgeHero';
import { RoleSelector } from '../components/forge/RoleSelector';
import { InterfaceShowcase } from '../components/forge/InterfaceShowcase';
import { SimpleParallaxTransition } from '../components/motion/SimpleParallaxTransition';

export default function ForgePage() {
    return (
        <div className="text-text-primary">
            <ForgeHero />

            <SimpleParallaxTransition variant="lines" height="h-1" />

            <InterfaceShowcase />

            <SimpleParallaxTransition variant="lines" height="h-1" />

            <RoleSelector />
        </div>
    );
}
