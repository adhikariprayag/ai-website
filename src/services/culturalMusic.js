export async function getMusicForCountry(countryName) {
  try {
    let tracks = [];

    // Global Live Radio ONLY
    let queryCountry = countryName;
    if (countryName === "United States of America") queryCountry = "United States";
    if (countryName === "South Korea") queryCountry = "South Korea";

    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bycountryexact/${encodeURIComponent(queryCountry)}?limit=40&order=votes&reverse=true&hidebroken=true`);
    const stations = await res.json();
    
    if (stations && stations.length > 0) {
        // Try to filter for top stations that focus on music over news/talk
        let validStations = stations.filter(s => s.url_resolved && !s.tags.includes('talk') && !s.tags.includes('news'));
        if (validStations.length === 0) validStations = stations; // fallback to all
        
        tracks = validStations.slice(0, 10).map(s => ({
            previewUrl: s.url_resolved,
            title: s.name.trim() || "Local Broadcast",
            artist: `Live Radio 📻 ${s.tags ? '• ' + s.tags.split(',')[0] : ''}`,
            art: s.favicon || null,
            type: "radio"
        }));
    }

    if (tracks.length === 0) {
        return [{
            previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/05/4b/d2/054bd2c6-c436-0be3-49db-8a95aa75d536/mzaf_12135109317146375687.plus.aac.p.m4a",
            title: "No Live Station Found",
            artist: "Try exploring another country!",
            type: "radio",
            art: null
        }];
    }

    return tracks;
  } catch (error) {
    console.error("Music API error:", error);
    return [];
  }
}
