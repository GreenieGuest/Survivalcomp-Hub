const ExportProfiles = (profiles) => {
    if (profiles){
        const jsonString = JSON.stringify(profiles, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "profiles.json";
        link.href = url;
        link.click();
    }
}

export { ExportProfiles };