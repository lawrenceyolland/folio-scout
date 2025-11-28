import {PackageJson} from "./packageJsonAnalyser";


type Framework = 'react' | 'vue' | 'angular' | 'astro' | "solid" | "svelte";
type MetaFramework = 'next' | 'nuxt' | "analog" | "svelteKit";

// TODO:
//  check package.json [done]
//  check root
//  check for cdn
class FrameworkAnalyser {
    private frameworks: Framework[] = ["react", "vue", "angular", "svelte", "astro", "solid"];
    private metaFrameworks: MetaFramework[] = ["next", "nuxt", "analog", "svelteKit"];

    private signals : Record<Framework | MetaFramework, string[]>= {
        react: ["@types/react", "@types/react-dom",
            "react", "react-dom",
            "@vitejs/plugin-react", "eslint-plugin-react-hooks",
            "eslint-plugin-react-refresh", "react-redux",],
        vue: ["vue", "@vue/", "eslint-plugin-vue", '@vitejs/plugin-vue', "pinia"],
        astro: ["astro", "eslint-plugin-astro", '@astrojs/'],
        angular: ["angular", "@angular-eslint/eslint-plugin"],
        solid: ["solid-js", "eslint-plugin-solid"],
        svelte: ["svelte", "eslint-plugin-svelte"],

        next: ["next", "eslint-config-next", "next-auth"],
        nuxt: ["nuxt", "@nuxt/", "vue-router"],
        analog: ['@analogjs/vite-plugin-angular'],
        svelteKit: ['@sveltejs/kit'],
    }

    private extraIncrements: Record<MetaFramework, Framework> = {
        next: "react",
        nuxt: "vue",
        analog: "angular",
        svelteKit: "svelte",
    }

    private frameworkSignals : Record<Framework | MetaFramework, number> = {
        react: 0,
        vue: 0,
        astro: 0,
        angular: 0,
        svelte: 0,
        next: 0,
        nuxt: 0,
        analog: 0,
        solid: 0,
        svelteKit: 0,
    }

    private frameworkCandidate : Framework | null = null
    private metaFrameworkCandidate : MetaFramework | null = null

    constructor(private pkg: PackageJson | null) {}

    private isFramework = (
        signals: Record<Framework | MetaFramework, string[]>,
        framework: Framework | MetaFramework,
        depKey: string,
        ) => {
        return signals[framework].some((rs) => depKey.startsWith(rs))
    }

    private matchesReactFallback = (depKey: string): boolean => {
        const lower = depKey.toLowerCase();

        // exclude Preact
        if (lower === "preact" || lower.startsWith("preact-")) {
            return false;
        }

        // exclude 'reactivity' packages
        if (lower.includes("reactiv")) {
            return false;
        }

        // can now check for presence of 'react' after collision checks
        return lower.includes("react");
    };

    hasFramework = (): Record<Framework | MetaFramework, number> => {
        if (!this.pkg) {
            return {} as Record<Framework | MetaFramework, number>
        }

        for (const key of Object.keys(this.pkg ?? {})) {
            if (key === 'dependencies' || key === 'devDependencies') {
                const deps = this.pkg?.[key] ?? {}
                for (const depKey of Object.keys(deps)) {
                    for (const signalKey of Object.keys(this.signals) as Array<keyof typeof this.signals>) {
                        if (this.isFramework(this.signals, signalKey, depKey) ||
                            (signalKey === 'react' ? this.matchesReactFallback(depKey) : depKey.includes(signalKey))) {
                            this.frameworkSignals[signalKey]++
                            if (signalKey in this.extraIncrements) {
                                const mappedFramework = this.extraIncrements[signalKey as MetaFramework]
                                this.frameworkSignals[mappedFramework]++
                            }
                            break;
                        }
                    }
                }
            }
            if (key === 'scripts') {
                for (const [_, scriptVal] of Object.entries(this.pkg?.scripts ?? {})) {
                    if (scriptVal.includes("next")) {
                        this.frameworkSignals.next++
                        this.frameworkSignals.react++
                    }
                    if (scriptVal.includes("nuxt")) {
                        this.frameworkSignals.nuxt++
                        this.frameworkSignals.vue++
                    }
                }
            }
        }

        return this.frameworkSignals
    }

    estimateFramework = () => {
        const sortedFrameworkScore = this.frameworks
            .map((fw) => [fw, this.frameworkSignals[fw]] as const)
            .sort(([,a], [,b]) => b - a);

        const frameworkCandidate = sortedFrameworkScore[0][0]

        const metaFrameworkCandidate = this.metaFrameworks.find((mfw) => {
            return this.frameworkSignals[mfw] > 0 && this.extraIncrements[mfw] === frameworkCandidate
        }) || null

        this.frameworkCandidate = frameworkCandidate;
        this.metaFrameworkCandidate = metaFrameworkCandidate;

        return {
            frameworkCandidate,
            metaFrameworkCandidate,
        }
    }

    getFrameworkVersion = (): string | null => {
        if (!this.frameworkCandidate) {
            return null;
        }

        return this.pkg?.dependencies?.[this.frameworkCandidate] ?? this.pkg?.devDependencies?.[this.frameworkCandidate] ?? null;
    }

    getMetaFrameworkVersion = (): string | null => {
        if (!this.metaFrameworkCandidate) {
            return null;
        }

        return this.pkg?.dependencies?.[this.metaFrameworkCandidate] ?? this.pkg?.devDependencies?.[this.metaFrameworkCandidate] ?? null;
    }
}

export default FrameworkAnalyser
