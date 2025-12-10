// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import supabase from "../lib/supabase";
import { AuthContext } from "../lib/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// ✅ yahan version control
// jab bhi bada change ho, is value ko change kar dena (v2, v3, v4 ...)
const APP_VERSION = "cm-dashboard-v3";
const APP_STORAGE_KEY = "cm-dashboard-version";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // helper: profile load karna
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

    // ✅ 1) Version check + storage clear
    if (typeof window !== "undefined") {
      try {
        const storedVersion = localStorage.getItem(APP_STORAGE_KEY);

        if (storedVersion !== APP_VERSION) {
          // Purane supabase tokens clear
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("sb-")) {
              localStorage.removeItem(key);
            }
          });

          sessionStorage.clear();
          localStorage.setItem(APP_STORAGE_KEY, APP_VERSION);
          console.log("Storage reset due to version change:", APP_VERSION);
        }
      } catch (e) {
        console.warn("Error clearing storage on version check:", e);
      }
    }

    async function initAuth() {
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          // agar token corrupt ho, force sign out + storage clear
          console.error("supabase.auth.getUser error:", error);

          if (typeof window !== "undefined") {
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("sb-")) localStorage.removeItem(key);
            });
            sessionStorage.clear();
          }

          await supabase.auth.signOut();
        }

        const currentUser = data?.user ?? null;
        if (ignore) return;

        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser);

          if (router.pathname === "/login") {
            router.replace("/");
          }
        } else {
          setProfile(null);
          if (router.pathname !== "/login") {
            router.replace("/login");
          }
        }
      } catch (e) {
        console.error("initAuth fatal error:", e);
        setUser(null);
        setProfile(null);
        if (router.pathname !== "/login") {
          router.replace("/login");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
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
