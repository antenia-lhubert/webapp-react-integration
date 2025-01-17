import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: '../novanet/react',
        emptyOutDir: true,
    },
    base: "", // Make the compiled paths relative
    plugins: [react()],
})