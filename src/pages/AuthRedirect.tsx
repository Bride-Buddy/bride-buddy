useEffect(() => {
  const handleAuthRedirect = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      navigate("/Auth");
      return;
    }

    // Fetch basic user info to decide onboarding vs returning
    const { data: timelineData } = await supabase
      .from("timeline")
      .select("engagement_date, wedding_date")
      .eq("user_id", session.user.id)
      .single();

    if (!timelineData?.engagement_date || !timelineData?.wedding_date) {
      navigate("/OnboardingChat");
    } else {
      navigate("/chat");
    }
  };

  handleAuthRedirect();
}, [navigate]);
