
const imgUrl = './img/'
const imgExt = '.png'

const initialPlacement = {
    // 'e5': ['w','q'],
    'c4': ['b','q'],
    'g5': ['b','p'],
    
    'a1': ['w','r'],
    'b1': ['w','k'],
    'c1': ['w','b'],
    'd1': ['w','q'],
    'e1': ['w','kk'],
    'f1': ['w','b'],
    'g1': ['w','k'],
    'h1': ['w','r'],

    'a2': ['w','p'],
    'b3': ['w','p'],
    'c2': ['w','p'],
    'd2': ['w','p'],
    'e2': ['w','p'],
    'f2': ['w','p'],
    'g4': ['w','p'],
    'h2': ['w','p'],
    
    'a8': ['b','r'],
    'b8': ['b','k'],
    'c8': ['b','b'],
    'd8': ['b','q'],
    // 'g6': ['b','kk'],
    'f8': ['b','b'],
    'g8': ['b','k'],
    'h8': ['b','r'],

    'a7': ['b','p'],
    'b7': ['b','p'],
    'c7': ['b','p'],
    'd7': ['b','p'],
    'e7': ['b','p'],
    'e5': ['b','p'],
    'g7': ['b','p'],
    'f5': ['w','p'],
}

function $( selector ) {
    return document.querySelector( selector )
}

function deepclone( obj ) {
    return JSON.parse( JSON.stringify( obj ) )
}

function getCols() {
    return [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ]
}

function getRows() {
    return [ '1', '2', '3', '4', '5', '6', '7', '8' ]
}

function getCell( col, row ) {
    return $(`[col="${col}"][row="${row}"]`)
}
function getCells() {
    return [ ...document.querySelectorAll( '.cell' ) ]
}

function generateChessModel() {
    const chessModel = {}

    for ( const col of getCols() ) {
        chessModel[ col ] = {}
    
        for ( const row of getRows() ) {
            chessModel[ col ][ row ] = {
                piece: [],
                potentials: []
            }
        }
    }

    return chessModel
}

function iterateChessModel( callbackFn ) {
    for ( const col in chessModel ) {
        for ( const row in chessModel[ col ] ) {
            const [ color, piece ] = chessModel[ col ][ row ].piece
            callbackFn( col, row, color, piece )
        }
    } 
}

function renderChessHtml() {
    const chessBoardHtml = $('#chessBoard')

    let isWhite = true

    for ( let i = 64; i >= 1; i-- ) {
        const cell = document.createElement( 'div' )
        cell.classList.add( 'cell' )
        cell.classList.add( isWhite ? 'white' : 'black' )
        
        const col = (i-1) % 8
        const row = Math.ceil( i / 8 )

        cell.setAttribute( 'col', getCols().reverse()[ col ] )
        cell.setAttribute( 'row', row )

        if ( col === 7 || row === 1 ) {
            const positionText = document.createElement( 'span' )
            positionText.classList.add( 'position-text' )
            positionText.innerText = (row === 1 ? cell.getAttribute( 'col' ) : '') +  (col === 7 ? cell.getAttribute( 'row' ) : '')
            cell.append( positionText )
        }
       
        chessBoardHtml.append( cell )

        isWhite = !isWhite 
        isWhite = i % 8 - 1 ? isWhite : !isWhite 
    }
}

function arangePiecesPositions() {
    for ( const position in initialPlacement ) {
        const [ col, row ] = position.split( '' )

        chessModel[ col ][ row ].piece = [ ...initialPlacement[ position ] ]
    }
}

function renderChessPieces() {
    iterateChessModel(( col, row, color, piece ) => {
        if ( color && piece ) {
            const img = document.createElement( 'img' )
            const imgSrc = `${ imgUrl }${ color }_${ piece }${ imgExt }`

            img.setAttribute( 'src', imgSrc )
            getCell( col, row ).append( img )
        }
    })
}

/////

function generateMovement( col, row ) {
    const [ color, piece ] = chessModel[ col ][ row ].piece

    const specificConfig = {
        'p': generatePawn,
        'r': generateRook,
        'k': generateKnight,
        'b': generateBishop,
        'q': generateQueen,
        'kk': generateKing,
    }

    specificConfig[ piece ]( col, row, color )
}

function generatePawn( col, row, color ) {
    const colNr = getCols().indexOf( col )
    const rowNr = parseInt( row )

    const isWhite = color === 'w'
    const offsetRow = isWhite ? +1 : -1
    const startingRow = isWhite ? 2 : 7
    const endingOffset = ( rowNr === startingRow ? 2 : 1 )

    if ( isWhite ) {
        for ( let _row = rowNr + offsetRow; _row <= rowNr + endingOffset; _row++ ) 
            checkPotentialPawn( color, col, row, col, _row, true ) 
    }
    else {
        for ( let _row = rowNr + offsetRow; _row >= rowNr - endingOffset; _row-- ) 
            checkPotential( color, col, row, col, _row, true ) 
    }

    checkPotentialPawn( color, col, row, getCols()[ colNr - 1 ], rowNr + offsetRow ) 
    checkPotentialPawn( color, col, row, getCols()[ colNr + 1 ], rowNr + offsetRow )

    checkPotentialEnPeasant( color, col, row, isWhite, colNr, rowNr, offsetRow )
}

function generateRook( col, row, color ) {
    const colNr = getCols().indexOf( col )
    const rowNr = parseInt( row )

    for ( let _col = colNr + 1; _col < 8; _col++ )
        if ( !checkPotential( color, col, row, getCols()[ _col ], row ) ) break

    for ( let _col = colNr - 1; _col >= 0; _col-- )
        if ( !checkPotential( color, col, row, getCols()[ _col ], row ) ) break

    for ( let _row = rowNr + 1; _row <= 8; _row++ )
        if ( !checkPotential( color, col, row, col, _row ) ) break

    for ( let _row = rowNr - 1; _row >= 0; _row-- )
        if ( !checkPotential( color, col, row, col, _row ) ) break
}

function generateKnight( col, row, color ) {
    const colNr = getCols().indexOf( col )
    const rowNr = parseInt( row )

    ;[
        [ +2, +1 ],
        [ +2, -1 ],
        [ -2, +1 ],
        [ -2, -1 ],
        [ +1, +2 ],
        [ +1, -2 ],
        [ -1, +2 ],
        [ -1, -2 ],
    ].forEach(([ offset1, offset2 ]) => {
        const _col = colNr + offset1
        const _row = rowNr + offset2
    
        checkPotential( color, col, row, getCols()[ _col ], _row )
    })
}

function generateBishop( col, row, color ) {
    const colNr = getCols().indexOf( col )
    const rowNr = parseInt( row )
    let _row

    _row = rowNr
    for ( let _col = colNr + 1; _col < 8; _col++ )
        if ( !checkPotential( color, col, row, getCols()[ _col ], ++_row ) ) break
    
    _row = rowNr
    for ( let _col = colNr + 1; _col < 8; _col++ )
        if ( !checkPotential( color, col, row, getCols()[ _col ], --_row ) ) break

    _row = rowNr
    for ( let _col = colNr - 1; _col >= 0; _col-- )
        if ( !checkPotential( color, col, row, getCols()[ _col ], --_row ) ) break
    
    _row = rowNr
    for ( let _col = colNr - 1; _col >= 0; _col-- )
        if ( !checkPotential( color, col, row, getCols()[ _col ], ++_row ) ) break
}

function generateQueen( col, row, color ) {
    generateRook(  col, row, color )
    generateBishop(  col, row, color )
}

function generateKing( col, row, color ) {
    const colNr = getCols().indexOf( col )
    const rowNr = parseInt( row )

    ;[
        [ +1, +1 ],
        [ +1, -1 ],
        [ -1, +1 ],
        [ -1, -1 ],
        [ 0, +1 ],
        [ 0, -1 ],
        [ +1, 0 ],
        [ -1, 0 ],
    ].forEach(([ offset1, offset2 ]) => {
        const _col = colNr + offset1
        const _row = rowNr + offset2
    
        checkPotential( color, col, row, getCols()[ _col ], _row )
    })
}

function checkPotential( color, col, row, _col, _row ) {
    if ( !chessModel?.[ _col ]?.[ _row ] ) return false

    const [ _color, _piece ] = chessModel[ _col ][ _row ].piece

    if ( !_color || color !== _color ) {
        chessModel[ col ][ row ].potentials.push( _col + _row )
    }

    return !_color
}
function checkPotentialPawn( color, col, row, _col, _row, exception = false ) {
    if ( !chessModel?.[ _col ]?.[ _row ] ) return false
    
    const [ _color ] = chessModel[ _col ][ _row ].piece

    if ( 
        (exception && !_color) || 
        (!exception && _color && color !== _color)
    ) {
        chessModel[ col ][ row ].potentials.push( _col + _row )
    }
}
function checkPotentialEnPeasant( color, col, row, isWhite, colNr, rowNr, offsetRow ) {
    let _col, _row
    
    if (!(
        (isWhite && rowNr === 5) ||
        (!isWhite && rowNr === 4)
    )) return
        
    _row = rowNr
    
    _col = colNr + 1
    checkEnpeasantDirection()
    
    _col = colNr - 1
    checkEnpeasantDirection()
    
    function checkEnpeasantDirection() {
        const _cell = chessModel?.[ getCols()[ _col ] ]?.[ _row ]
        if ( !_cell?.piece.length ) return
        
        const [ _color, _piece ] = _cell.piece
    
        if ( _color && color !== _color && _piece === 'p' ) {
            if ( !!chessModel?.[ getCols()[ _col ] ]?.[ rowNr + offsetRow ]?.piece?.length ) return
    
            chessModel[ col ][ row ].potentials.push( getCols()[ _col ] + ( rowNr + offsetRow ) )
        }
    }
    
}

//////

function addEventListeners() {
    getCells().forEach( cell => {
        cell.addEventListener( 'click', function(){
            const col = cell.getAttribute( 'col' )
            const row = cell.getAttribute( 'row' )

            /// move piece
            if ( !!pieceSelected.length && cell.classList.contains('highlight')) {
                const [ _col, _row ] = pieceSelected
                const [ _color, _piece ] = chessModel[ _col ][ _row ].piece
                
                // en peasant 
                const removeRow = parseInt(row) + ( _color === 'w' ? -1 : +1 ) 
                const [ a, piece ] = chessModel[ col ][ row ].piece
                const [ color, b ] = chessModel[ col ][ removeRow ].piece
                
                if ( !piece && color !== _color && _piece === 'p' ) {
                    const removeCell = getCell( col, removeRow.toString() )
                    
                    removeCell?.querySelector( 'img' )?.remove()

                    chessModel[ col ][ removeRow.toString() ] = {
                        piece: [],
                        potentials: []
                    }
                }

                // remove previous cell
                const _cell = getCell(_col, _row)
                const _img = _cell.querySelector( 'img' )
                
                cell.querySelector( 'img' )?.remove()
                cell.append( _img )

                chessModel[ col ][ row ] = {
                    piece: [ ...chessModel[ _col ][ _row ].piece ],
                    potentials: []
                }

                chessModel[ _col ][ _row ] = {
                    piece: [],
                    potentials: []
                }

                dehilightCells()
                pieceSelected = []
                isWhiteTurn = !isWhiteTurn
            }

            /// generate movement
            else if ( canMove( col, row ) ) {
                pieceSelected = [ col, row ]
                generateMovement( col, row )
                highlightPotentials( col, row )
            }
        })
    })
}

function canMove( col, row ) {
    const hasPiece = !!chessModel[ col ][ row ].piece.length
    const [ color ] = chessModel[ col ][ row ].piece

    return hasPiece && (isWhiteTurn && color === 'w' || !isWhiteTurn && color === 'b' )
}

function dehilightCells() {
    getCells().forEach( cell => cell.classList.remove( 'highlight' ) )
}

function highlightPotentials( col, row ) {
    dehilightCells()

    const { potentials } = chessModel[ col ][ row ]
    
    potentials.forEach( position => {
        const [ col, row ] = position.split( '' )
        const cell = getCell( col, row )
        cell.classList.add( 'highlight')
    })
}


/////

renderChessHtml()
let pieceSelected = []
let isWhiteTurn = true
const chessModel = generateChessModel()

arangePiecesPositions()
renderChessPieces()
addEventListeners()

window.chessModel = chessModel

