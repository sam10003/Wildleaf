
/*
this collection contains:
 - every canonical name of any species ranked lower than LC
 - collected from the IUCN
*/

import mongoose from 'mongoose';

const canonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true }
});

const Canon = mongoose.model('Canon', canonSchema,'Canon_list');
export default Canon;
