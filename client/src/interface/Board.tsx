import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getGame, initBoard } from '../store/actions/board/board';
import Field from './Field';



const Board = ({ board, initBoard, table, match, getGame, socket, toggleConfig, setToggleConfig }: any) => {


    const [selectedData, setSelectedData] = useState<any>(null)

    useEffect(() => {
        getGame(match.params.gameid)
        setToggleConfig(false)

        return () => {
            getGame(match.params.gameid)
            setToggleConfig(true)
        }
    }, [getGame, match.params.gameid])
    
    

    useEffect(() => {
        if (socket) {
            socket.on('movement', (msg: any) => {

                getGame(match.params.gameid)
                setToggleConfig(false)
                console.log('reload now')
            })
            
        }
    }, [socket])
    
    const [moved, setMoved] = useState(false)
    const [dangerous, setDangerous] = useState<any[]>([])

    
    console.log(dangerous)
    
    return (
        <Fragment>
            
            
                
            <div className="fields">
                {
                    board.game && board.game.finished && <div className="play-next"><span onClick={e=> initBoard(board.game.players, table.table)}>play next</span></div>
                }
                {
                    board.game && board.game.board.map((field: any, index: number) => <Field key={field._id} index={index} field={field} selectedData={selectedData} setSelectedData={setSelectedData} moved={moved} setMoved={setMoved} socket={socket} dangerous={dangerous} setDangerous={setDangerous} />)
                }
                
            </div>
            
        </Fragment>
    );
}
const mapStateToProps = (state: any) => ({
    board: state.board,
    auth: state.auth
})
export default connect(mapStateToProps, { initBoard, getGame })(withRouter(Board));