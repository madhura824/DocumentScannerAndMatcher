// resetCredits.ts

import { resetTotalCreditsQuery } from "../database/queries/userQueries";

async function resetTotalCredits() {
    console.log('Resetting total credits...');
    const result = await resetTotalCreditsQuery(); // Reset credits in the database
    if (result) {
        console.log('Total credits have been reset to 20 for all users.');
    } else {
        console.log('Failed to reset total credits.');
    }
}

export function resetTotalCreditsAtMidnight() {
    const now = new Date();

    
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); 

    
    const msUntilMidnight = midnight.getTime() - now.getTime();

    
    setTimeout(() => {
        resetTotalCredits();  
        setInterval(resetTotalCredits, 86400000); 
    }, msUntilMidnight);
}
