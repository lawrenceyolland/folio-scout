import {PackageJson} from "./packageJsonAnalyser";


type Frameworks = 'react' | 'vue' | 'angular' | 'astro' | "solid" | "svelte";
type MetaFrameworks = 'next' | 'nuxt' | "analog" | "svelteKit";


// TODO:
//  check package.json [done]
//  check root
//  check for cdn
class ProjectAnalysis {
    constructor() {
    }

    private isFramework = (signals: Record<Frameworks | MetaFrameworks, string[]>,framework: Frameworks | MetaFrameworks, depKey: string) => {
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

    hasFramework = (pkg: PackageJson): Record<Frameworks | MetaFrameworks, number> => {
        if (!pkg) {
            return {} as Record<Frameworks | MetaFrameworks, number>
        }

        const signals : Record<Frameworks | MetaFrameworks, string[]>= {
            react: ["@types/react", "@types/react-dom",
                "react", "react-dom",
                "@vitejs/plugin-react", "eslint-plugin-react-hooks",
                "eslint-plugin-react-refresh", "react-redux",],
            vue: ["vue", "@vue/", "eslint-plugin-vue", '@vitejs/plugin-vue', "pinia"],
            astro: ["astro", "eslint-plugin-astro", '@astrojs/'],
            angular: ["angular", "@angular-eslint/eslint-plugin"],

            solid: ["solid-js", "eslint-plugin-solid"],
            svelte: ["svelte", "eslint-plugin-svelte"],

            next: ["next", "eslint-config-next"],
            nuxt: ["nuxt", "@nuxt/", "vue-router"],
            analog: ['@analogjs/vite-plugin-angular'],
            svelteKit: ['@sveltejs/kit'],
        }

        const extraIncrements: Record<MetaFrameworks, Frameworks> = {
            next: "react",
            nuxt: "vue",
            analog: "angular",
            svelteKit: "svelte",
        }

        const frameworkSignals : Record<Frameworks | MetaFrameworks, number> = {
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

        for (const key of Object.keys(pkg ?? {})) {
            if (key === 'dependencies' || key === 'devDependencies') {
                const deps = pkg?.[key] ?? {}
                for (const depKey of Object.keys(deps)) {
                    for (const signalKey of Object.keys(signals) as Array<keyof typeof signals>) {
                        if (this.isFramework(signals, signalKey, depKey) ||
                            (signalKey === 'react' ? this.matchesReactFallback(depKey) : depKey.includes(signalKey))) {

                            frameworkSignals[signalKey]++
                            if (signalKey in extraIncrements) {
                                const mappedFramework = extraIncrements[signalKey as MetaFrameworks]
                                frameworkSignals[mappedFramework]++
                            }
                            break;
                        }
                    }
                }
            }
            if (key === 'scripts') {
                for (const [scriptKey, scriptVal] of Object.entries(pkg?.scripts ?? {})) {
                    if (scriptVal.includes("next")) {
                        frameworkSignals.next++
                        frameworkSignals.react++
                    }
                    if (scriptVal.includes("nuxt")) {
                        frameworkSignals.nuxt++
                        frameworkSignals.vue++
                    }
                }
            }
        }

        return frameworkSignals
    }

    estimatedFramework = (frameworkSignals : Record<Frameworks | MetaFrameworks, number>) => {
        return Object.entries(frameworkSignals ?? {}).sort(([, v1],[,v2]) => v2-v1)[0][0]
    }
}

export default ProjectAnalysis