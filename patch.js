      // Check if this is a back/forward navigation
      let isBackForward = false;
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        isBackForward = navEntries[0].type === "back_forward";
      } else if (window.performance && performance.navigation) {
        isBackForward = performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD;
      }

      if (isBackForward) {
        // Restore state only if navigating back
        detailsElements.forEach(details => {
          const state = sessionStorage.getItem(details.id);
          if (state === "open") {
            details.setAttribute("open", "");
          } else if (state === "closed") {
            details.removeAttribute("open");
          }
        });
      } else {
        // Otherwise start collapsed and clear old states
        detailsElements.forEach(details => {
          sessionStorage.removeItem(details.id);
          details.removeAttribute("open");
        });
      }
