import "../styles/globals.css";
import "../styles/tailwind.css";
import "instantsearch.css/themes/satellite.css";
import "../styles/typewriter.css";
import "katex/dist/katex.min.css";
import { QueryClient, QueryClientProvider } from "react-query";
import TopNav from "../components/TopNav";
import { DarkProvider } from "../components/DarkToggle";

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkProvider>
        <div className="dark:bg-black min-h-screen flex flex-col">
          <TopNav className="dark:bg-black shadow-lg" />
          <Component {...pageProps} />
        </div>
      </DarkProvider>
      {/* <ReactQueryDevtools initialIsOpen={true} /> */}
    </QueryClientProvider>
  );
}

export default MyApp;
