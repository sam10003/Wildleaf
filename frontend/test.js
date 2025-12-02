// test fetch on frontend
fetch("http://52.203.48.52:5000/")
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);