import React from 'react'
// import {files} from '../Data'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import ContentList from './ContentList'
import ContextMenu from './ContextMenu'
const URL = 'http://localhost:3000/api/v1/folders'

export default class Window extends React.Component {

  constructor(){
    super()
    this.state = {
      folders : [],
      clickedRow : null,
      highlightedRow : null,
      //refactor
      activeContent : 'Documents',
      search : "",
      sortBy : null,
      ascending : false,
      // refactor
      sort: {by: null, ascending: false},
      contextMenu : null,
      renamingFile : null,
      newFileName : null,
      //refactored
      history: {back: [], forward: []},
      window: {height: null, width: null, focused: true}
    }
  }

  componentDidMount = () => {
    fetch(URL)
    .then(res => res.json())
    .then(res => this.setState({folders: res }))
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
    window.addEventListener("blur", this.focusBlur)
    window.addEventListener("focus", this.focusBlur)
  }

  updateWindowDimensions = () => {
    let newDimensions = {height: window.innerHeight, width: window.innerWidth, focused: true}
    this.setState({window: newDimensions, contextMenu: null})
  }

  handleKeydown = e => {
    if(e.keyCode === 38 || e.keyCode === 40){
      e.preventDefault()
      this.setState({renamingFile: null, newFileName: "", highlightedRow: null})
    }
    let row = this.state.clickedRow
    let allRows = document.getElementsByClassName('row')
    if(row !== null){
      if(e.keyCode === 38){this.setState({clickedRow : row > 0 ? row-1 : allRows.length-1})}
      if(e.keyCode === 40){this.setState({clickedRow : row < allRows.length-1 ? row+1 : 0})}
      let activeRow = [...allRows].find(rowNum => {return parseInt(rowNum.dataset.id) === this.state.clickedRow})
      activeRow.scrollIntoViewIfNeeded()
    }
  }

  clearContextMenu = e => {
    e.preventDefault()
    if(e.target.parentNode.className !== 'context-menu'){
      if(e.type === 'click' || e.target.parentNode.className !== 'row'){
        this.setState({contextMenu : null})
      }
    }
  }

  renderContextMenu = e => {
    e.preventDefault()
    if(this.state.window.focused){
      let rowId = parseInt(e.currentTarget.dataset.id)
      let contextMenuInfo = {target: e.currentTarget, targetRow: rowId, x: e.clientX, y: e.clientY}
      this.setState({contextMenu : contextMenuInfo, highlightedRow: rowId, clickedRow : null, renamingFile: null, newFileName: ""})
    }
  }

  renameFile = () => {
    this.setState({clickedRow: this.state.contextMenu.targetRow, renamingFile: parseInt(this.state.contextMenu.target.id)})
  }

  handleNameChange = e => {
    this.setState({newFileName : e.currentTarget.value})
  }

  selectRow = e => {
    let id = parseInt(e.currentTarget.dataset.id, 10)
    if(id === this.state.clickedRow){console.log('2x clicked')}
    else{
      this.setState({clickedRow: id, highlightedRow: null, renamingFile: null, newFileName: "", })
    }
  }

  selectFileset = e => {
    if(e.currentTarget.id !== this.state.activeContent){
      let newHistory = Object.assign(this.state.history)
      newHistory.back = [...this.state.history.back, this.state.activeContent]
      this.setState({history: newHistory, clickedRow: null, highlightedRow: null, sortBy : null, search : "", renamingFile: null, newFileName: ""})
    }
    this.setState({activeContent: e.currentTarget.id, sortBy : null})
  }

  handleSearch = e => {
    this.setState({search : e.currentTarget.value, clickedRow : null, highlightedRow: null, renamingFile: null, newFileName: ""})
  }

  selectSortBy = e => {
    let category = e.currentTarget.querySelector('span').innerText
    if (this.state.sortBy === category){
      this.setState({ascending : !this.state.ascending, clickedRow : null, highlightedRow: null,})
    }else{
      this.setState({sortBy: category, clickedRow : null, highlightedRow: null, renamingFile: null, newFileName: ""})
    }
  }

  updateHistory = (direction) => {
    let currentHistory = Object.assign(this.state.history)
    let directionHistory = currentHistory[direction]
    if(directionHistory.length > 0){
      let nextItem = directionHistory.pop()
      if(direction === 'back'){
        currentHistory = {back: directionHistory, forward: [...this.state.history.forward, this.state.activeContent]}
      }if(direction === 'forward'){
        currentHistory = {back: [...this.state.history.back, this.state.activeContent], forward: directionHistory}
      }
      this.setState({history: currentHistory, activeContent: nextItem, clickedRow : null, search : "", renamingFile: null, newFileName: ""})
    }
  }


  focusBlur = e => {
    let windowState = Object.assign(this.state.window)
    windowState.focused = e.type === 'focus'
    this.setState({window: windowState})
    if (!this.state.focused){
      this.setState({contextMenu: null, highlightedRow: null})
    }
  }

  renderContents = () => {
    if (this.state.folders.length !== 0) {
      document.addEventListener("keydown", this.handleKeydown)
      return <div className="window-container" onClick={this.clearContextMenu} onContextMenu={this.clearContextMenu}>
        <Topbar data={this.state} updateHistory={this.updateHistory} handleSearch={this.handleSearch}/>
        <ContentList data={this.state} selectRow={this.selectRow} selectSortBy={this.selectSortBy} renderContextMenu={this.renderContextMenu} handleNameChange={this.handleNameChange}/>
        <Sidebar data={this.state} selectFileset={this.selectFileset}/>
        {this.state.contextMenu ? <ContextMenu info={this.state.contextMenu} renameFile={this.renameFile}/> : null}
      </div> }
    else { return null }
  }



  render() {
    return(this.renderContents())
  }
}
