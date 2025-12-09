// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import supabase from "../lib/supabase";
import { AuthContext } from "../lib/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// 👇 yahan app version rakho – jab bhi koi bada change ho (auth / supabase / storage),
// sirf is string ko change kar dena (v1 -> v2)
const APP_VERSION = "cm-dashboard-v1";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1) YE useEffect SIRF CACHE / STORAGE HANDLE KAREGA
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedVersion = window.localStorage.getItem("cm_app_version");

        if (storedVersion !== APP_VERSION) {
          console.log("Clearing local cache because app version changed");

          // purani keys, tokens, sab hata do
          window.localStorage.clear();
          window.sessionStorage.clear();

          // apni new app version set kar do
          window.localStorage.setItem("cm_app_version", APP_VERSION);
        }
      } catch (err) {
        console.error("Error while clearing cache", err);
      }
    }
  }, []); // 👈 sirf first load per chalega

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

  // ✅ 2) YE wala useEffect tumhara existing auth + routing handle kar raha hai
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
