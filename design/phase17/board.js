
const details=document.getElementById('extended-provenance');
details.addEventListener('toggle',()=>{document.getElementById('disclosure-result').textContent=details.open?'Secondary details open. Essential record stays visible.':'Secondary details closed. Essential record stays visible.';});
document.getElementById('reviewer-correction').addEventListener('click',event=>{event.preventDefault();document.getElementById('board-reviewer').focus();document.getElementById('focus-result').textContent='Reviewer field focused. No data was submitted.';});
