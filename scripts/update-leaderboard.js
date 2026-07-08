/**
 * File: update-leaderboard.js
 * 
 * A script that automatically generates the leaderboard.json file for the leaderboard page.
 * 
 * Programmer: Neil Ghugare
 * 
 * Revision History:
 *      07/06/2026 Initial version created with doc comments.
 *      07/07/2026 Include resources not in subfields.
 * 
 * Notes:
 * Run locally with Node/NPM. Will require a Cheerio installation, which can be done through "npm install cheerio".
 * This assumes you already have NPM on your local machine.
 * Then you can run "node scripts/update-leaderboard.js" or "node update-leaderboard.js", or equivalent.
 * Make sure not to commit the Node/NPM files to the repository.
 */

// --- 1. NPM Requirements ---
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// --- 2. Preparation and File Fetching ---

// Get the subfields directory and the root repo directory locally.
const subfieldsDir = path.join(__dirname, '../subfields'); 
const repoRootDir = path.join(__dirname, '../');

// A subfield map for mapping the pages of the HTML files to their actual subfield names.
const subfieldMap = {
    'bio': 'Biophysics & Geophysics',
    'education': 'Physics Education',
    'education': 'Astrophysics',
    'experiment': 'Experimental Techniques',
    'mathematical': 'Math & Engineering Physics',
    'particle': 'Particle & Nuclear Physics',
    'quantum': 'Quantum Information',
    'amo': 'Condensed Matter & AMO'
};

// Get the HTML files from the subfield directory and other locations.
const subfieldFiles = fs.readdirSync(subfieldsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(subfieldsDir, file));
const rootFilesToInclude = [path.join(repoRootDir, 'getting_started.html'),
    path.join(repoRootDir, 'learning_resources.html')
];
const files = [...subfieldFiles, ...rootFilesToInclude]; // All files that contributors can contribute to.

// Initialize a contributor list.
const contributors = {};

// --- 3. Scrape the Subfield Files ---

// Loop through each subfield file.
files.forEach(file => {
    // Get the exact filename without the ".html" extension, and lowercase it.
    const filenameKey = path.basename(file, '.html').toLowerCase();

    // Look up the title in our subfield map. 
    // If it's not in the dictionary, fall back to a capitalized version of the filename.
    const currentSubfield = subfieldMap[filenameKey] || filenameKey
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    // Load the HTML file via Cheerio for scraping.
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);

    // Fetch each element with a "resource-contributor" id.
    $('.resource-contributor').each((i, el) => {
        // Get the text of the element (trimmed).
        const fullText = $(el).text().trim();
        
        // Find the contributor's name and institution via trimming.
        if (fullText.startsWith('Contributor:')) {
            const cleanText = fullText.replace('Contributor:', '').trim();
            const parts = cleanText.split(',');
            
            const name = parts[0] ? parts[0].trim() : '';
            const institution = parts[1] ? parts[1].trim() : 'Unknown';

            // Skip anonymous entries.
            if (name.toLowerCase() === 'anonymous') {
                return;
            }

            // Check if the name exists.
            if (name) {
                // If the contributor is not already in the list, we add a new instance.
                if (!contributors[name]) {
                    contributors[name] = {
                        name: name,
                        institution: institution,
                        count: 0,
                        subfieldCounts: {}
                    };
                }
                
                // We now increment the number of contributions and check the most occuring subfield contribution.
                contributors[name].count += 1;
                contributors[name].subfieldCounts[currentSubfield] = (contributors[name].subfieldCounts[currentSubfield] || 0) + 1;
                
                // Dynamic check to see if we need to update the user's institution.
                if (contributors[name].institution === 'Unknown' && institution !== 'Unknown') {
                    contributors[name].institution = institution;
                }
            }
        }
    });
});

// --- 4. Filtering and Sorting the Leaderboard ---

// Filter, sort, and determine the primary subfield.
const sortedLeaderboard = Object.values(contributors)
    .filter(c => c.count > 1)               // Remove entries that don't have at least 2 contributions.
    .sort((a, b) => b.count - a.count)      // Sort the contributions.
    .map(c => {                             // Map the contributions by primary subfield and max count.
        let primarySubfield = 'General';
        let maxCount = 0;

        // Loop to check primary subfield contributions.
        for (const [subfield, count] of Object.entries(c.subfieldCounts)) {
            if (count > maxCount) {
                maxCount = count;
                primarySubfield = subfield;
            }
        }

        // Return the finalized instance per contributor.
        return {
            name: c.name,
            institution: c.institution,
            count: c.count,
            subfield: primarySubfield
        };
    });

// --- 5. Final Steps ---

// Generate the final payload.
// This includes the current date this file ran for the "Last Updated" title of the leaderboard page.
// This also includes the sorted leaderboard itself.
const finalPayload = {
    lastUpdated: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }),
    entries: sortedLeaderboard
};

// Write the file to the root repo directory as a JSON file.
fs.writeFileSync(
    path.join(repoRootDir, 'leaderboard.json'), 
    JSON.stringify(finalPayload, null, 2) // Saves the payload object instead of just the array.
);

// Log to the console that the leaderboard has been updated with its new timestamp.
console.log(`Leaderboard updated with timestamp!`);

