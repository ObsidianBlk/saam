
const {app} = require('electron');
const fs = require('fs');
const path = require('path');

const CONF_FILE_NAME = 'saam.conf.json';

const readFile = (path) => {
  return new Promise((res, rej) => {
    fs.readFile(path, 'utf8', (err, data) => {
      res((err) ? null : data);
    });
  });
};


let confdata = (async () => {
  let confPaths = [
    path.join(app.getPath('userData'), CONF_FILE_NAME),
    path.join(app.getPath('home'), '.saam', CONF_FILE_NAME),
    path.join(app.getAppPath(), CONF_FILE_NAME)
  ];
  for (let i=0; i < confPaths.length; i++){
    let res = await readFile(confPaths[i]);
    if (res !== null){
      try{
        return JSON.parse(res);
      } catch (e) {
        console.log("WARNING: Malformed data at ", confPaths[i]);
      }
    }
  }
  return {};
})();


class ConfigNode{
  constructor(parent = null, data = null, name = ""){
    this.__parent = null;
    this.__name = "";
    this.__data = confdata;
    if ((parent instanceof ConfigNode) && (typeof data === 'object') && parent.hasSection(name)){
      this.__parent = parent;
      this.__name = name;
      this.__data = data
    }
  }

  getRoot(){
    if (this.__parent !== null)
      return this.__parent.getRoot();
    return this;
  }

  getParent(){
    return this.__parent;
  }

  getName(fullName = false){
    if (fulleName && this.__parent !== null){
      return this.__parent.getName(true) + "." + this.__name;
    }
    return this.__name;
  }

  sections(){
    let keys = Object.keys(this.__data);
    let list = [];
    for (let i=0; i < keys.length; i++){
      if (typeof this.__data[keys[i]] === 'object')
        list.push(keys[i]);
    }
    return list;
  }

  keys(){
    let keys = Object.keys(this.__data);
    let list = [];
    for (let i=0; i < keys.length; i++){
      if (typeof this.__data[keys[i]] !== 'object')
        list.push(keys[i]);
    }
    return list;
  }

  hasSection(name){
    return ((name in this.__data) && (typeof this.__data[name] === 'object'));
  }

  getSection(name, noErrorIfExists = false){
    if (this.hasSection(name)){
      return new ConfigNode(this, this.__data[name], name);
    } else if (noErrorIfExists){
      return null;
    }
    throw new Error("No Section '" + name + "' exists.");
  }

  addSection(name, noErrorIfExists = false){
    if (!(name in this.__data)){
      this.__data[name] = {};
    } else if (!noErrorIfExists){
      throw new Error("Value or Section '" + name + "' already exists.");
    } 
    return this;
  }

  removeSection(name, noErrorOnFail = false){
    if (this.hasSection(name)){
      if (Object.keys(this.__data[name]).length <= 0){
        delete this.__data[name];
      } else if (!noErrorOnFail){
        throw new Error("Section '" + name + "' is not empty. Cannot remove.");
      } 
    }
    return this;
  }

  hasValue(name){
    return ((name in this.__data) && (typeof this.__data[name] !== 'object'));
  }

  getValue(name, defval = null){
    return (name in this.__data) ? this.__data[name] : defval;
  }

  setValue(name, value){
    if (!this.hasSection(name)){
      this.__data[name] = value;
    } else {
      throw new Error("Name '" + name + "' defined as a section. Cannot override.");
    }
    return this;
  }

  clearValue(name){
    if (!this.hasSection(name)){
      if (name in this.__data)
        delete this.__data[name];
    } else {
      throw new Error("Name '" + name + "' defined as a section. Cannot remove.");
    }
    return this;
  }

  toJSON(){
    JSON.stringify(confdata);
  }

}


module.exports = ConfigNode;

