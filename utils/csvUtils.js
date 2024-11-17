/**
 * Creates and downloads a CSV file from the provided data
 * @param {Object[]} data - Array of data points to convert to CSV
 * @param {Object} config - Configuration object for the CSV
 * @param {Object} config.columns - Object mapping column keys to their display names
 * @param {string} config.filename - Name of the file to download (without .csv extension)
 */
export const downloadCSV = (data, config) => {
    const { columns, filename } = config;
  
    // Create header row using the provided column display names
    const header = Object.values(columns).join(',') + '\n';
  
    // Create CSV content
    const csvContent = data.map(point => {
      return Object.keys(columns).map(key => {
        if (key === 'date' || key.toLowerCase().includes('time')) {
          // Format date as DD/MM/YYYY HH:mm:00
          const date = new Date(point[key]);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}:00`;
        }
        // Handle numeric values - ensure proper decimal formatting
        if (typeof point[key] === 'number') {
          return point[key].toFixed(2);
        }
        return point[key];
      }).join(',');
    }).join('\n');
  
    // Combine header and content
    const fullCSV = header + csvContent;
  
    // Create and trigger download
    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };