// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import supabase from "../lib/supabase";
import { AuthContext } from "../lib/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ helper: profile load karna
  async function fetchProfile(currentUser) {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (!error) {
      setProfile(data);
    } else {
      console.error("Error loading profile", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function initAuth() {
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();
      const currentUser = data?.user ?? null;

      if (ignore) return;

      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);

        // agar login page par ho aur already logged in ho
        if (router.pathname === "/login") {
          router.replace("/");
        }
      } else {
        setProfile(null);
        // koi user nahi -> login page par bhej do
        if (router.pathname !== "/login") {
          router.replace("/login");
        }
      }

      setLoading(false);
    }

    initAuth();

    // 🔔 auth state listener (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);

        if (authUser) {
          await fetchProfile(authUser);
          if (router.pathname === "/login") {
            router.replace("/");
          }
        } else {
          setProfile(null);
          if (router.pathname !== "/login") {
            router.replace("/login");
          }
        }
      }
    );

    return () => {
      ignore = true;
      listener?.subscription?.unsubscribe();
    };
  }, [router.pathname]);

  const isAuthPage = router.pathname === "/login";

  // ⏳ loading state (sirf dashboard pages pe)
  if (!isAuthPage && loading) {
    return (
      <AuthContext.Provider value={{ user, profile, loading }}>
        <div className="page">
          <div className="layout-main">
            <div className="card">
              <h2>Loading dashboard…</h2>
            </div>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  const content = isAuthPage ? (
    <Component {...pageProps} />
  ) : (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {content}
    </AuthContext.Provider>
  );
}

export default MyApp;
