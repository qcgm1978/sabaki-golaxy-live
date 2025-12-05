const {h, Component} = require('preact')
const {getLiveReports, syncGolaxyOrYikeLizban, golaxy} = require('./golaxy.js')

class GolaxyLiveWidget extends Component {
  constructor(props) {
    super(props)
    this.state = {
      liveGames: [],
      searchQuery: '',
      isLoading: false,
      selectedGame: null,
      isSyncing: false,
      isSyncButtonClicked: false,
      syncingGameId: null,
      lastMove: null
    }
  }

  async componentDidMount() {
    await this.fetchLiveGames()

    if (this.props.onLoad) {
      this.props.onLoad(golaxy)
    }

    golaxy.setSyncSgfCallback(async (gameId, sgfContent) => {
      if (this.props.onSyncSgf) {
        await this.props.onSyncSgf(gameId, sgfContent)
      }
    })
  }

  async fetchLiveGames() {
    this.setState({isLoading: true})
    const games = await getLiveReports(this.state.searchQuery)
    this.setState({liveGames: games, isLoading: false})
  }

  handleSearch = e => {
    this.setState({searchQuery: e.target.value})
  }

  handleSearchSubmit = async e => {
    e.preventDefault()
    await this.fetchLiveGames()
  }

  handleGameSelect = game => {
    this.setState({selectedGame: game})
    if (this.props.onGameSelect) {
      this.props.onGameSelect(game)
    }
  }

  handleSyncToBoard = async () => {
    if (!this.state.selectedGame) return

    const game_id = this.state.selectedGame.liveId

    this.setState({syncingGameId: game_id, isSyncButtonClicked: true})

    const url = `${golaxy.golaxyLiveUrl}/${game_id}`
    const sgfContent = await golaxy.getSgfByGolaxy(url)

    if (sgfContent) {
      await golaxy.syncSgf(game_id, sgfContent)
    }
  }

  handleStopSync = () => {
    golaxy.stopSync()
    this.setState({
      selectedGame: null,
      isSyncing: false,
      isSyncButtonClicked: false,
      syncingGameId: null,
      lastMove: null
    })
    if (this.props.onStopSync) {
      this.props.onStopSync()
    }
  }

  syncLiveGame = async (is_live = true) => {
    const game_id = this.state.selectedGame.liveId
    await syncGolaxyOrYikeLizban([game_id], is_live)
    const [
      game,
      title,
      PB,
      PW,
      RE,
      DT,
      totalMoves,
      lastMove
    ] = golaxy.getPropsBySgfStr(golaxy.sgf)
    this.setState({lastMove})
    if (RE === 'Unknown Result') {
      golaxy.startSync(game_id, totalMoves, lastMove, PB, PW)
      this.setState({isSyncing: true})
      if (this.props.onStartSync) {
        this.props.onStartSync(game_id)
      }
    }
  }

  render() {
    const {
      liveGames,
      searchQuery,
      isLoading,
      selectedGame,
      isSyncing
    } = this.state

    const i18n = {
      search: this.props.t ? this.props.t('golaxy', 'Search') : 'Search',
      searchPlaceholder: this.props.t
        ? this.props.t('golaxy', 'Search players or events')
        : 'Search players or events',
      loading: this.props.t
        ? this.props.t('golaxy', 'Loading...')
        : 'Loading...',
      unnamedGame: this.props.t
        ? this.props.t('golaxy', 'Unnamed game')
        : 'Unnamed game',
      move: this.props.t ? this.props.t('golaxy', 'Move') : 'Move',
      live: this.props.t ? this.props.t('golaxy', 'Live') : 'Live',
      newMove: this.props.t ? this.props.t('golaxy', 'New move') : 'New move',
      noGames: this.props.t
        ? this.props.t('golaxy', 'No matching games found')
        : 'No matching games found',
      syncToBoard: this.props.t
        ? this.props.t('golaxy', 'Sync to board')
        : 'Sync to board',
      startSync: this.props.t
        ? this.props.t('golaxy', 'Start sync')
        : 'Start sync',
      stopSync: this.props.t
        ? this.props.t('golaxy', 'Stop sync')
        : 'Stop sync',
      refresh: this.props.t
        ? this.props.t('golaxy', 'Refresh list')
        : 'Refresh list'
    }

    return h(
      'div',
      {className: 'golaxy-live-widget', style: this.props.style || {}},
      [
        h(
          'div',
          {
            className: 'golaxy-live-header',
            style: {
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ddd'
            }
          },
          [
            h(
              'h3',
              {style: {margin: '0 0 10px 0', fontSize: '18px'}},
              'Golaxy Live Games'
            ),
            h(
              'form',
              {
                onSubmit: this.handleSearchSubmit,
                style: {display: 'flex', gap: '5px'}
              },
              [
                h('input', {
                  type: 'text',
                  value: searchQuery,
                  onChange: this.handleSearch,
                  placeholder: i18n.searchPlaceholder,
                  style: {
                    flex: 1,
                    padding: '5px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }
                }),
                h(
                  'button',
                  {
                    type: 'submit',
                    style: {
                      padding: '5px 10px',
                      fontSize: '14px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }
                  },
                  i18n.search
                )
              ]
            )
          ]
        ),

        h('div', {style: {maxHeight: '75vh', overflowY: 'auto'}}, [
          isLoading
            ? h(
                'div',
                {style: {padding: '20px', textAlign: 'center'}},
                i18n.loading
              )
            : h(
                'div',
                {
                  className: 'golaxy-live-games-list',
                  style: {
                    backgroundColor: 'white'
                  }
                },
                [
                  liveGames.length > 0
                    ? liveGames.map(game =>
                        h(
                          'div',
                          {
                            key: game.id,
                            className: `golaxy-live-game-item ${
                              selectedGame && selectedGame.id === game.id
                                ? 'selected'
                                : ''
                            }`,
                            onClick: () => this.handleGameSelect(game),
                            style: {
                              padding: '10px',
                              borderBottom: '1px solid #eee',
                              cursor: 'pointer',
                              backgroundColor:
                                selectedGame && selectedGame.id === game.id
                                  ? '#e8f5e9'
                                  : 'transparent',
                              transition: 'background-color 0.2s'
                            }
                          },
                          [
                            h(
                              'div',
                              {
                                style: {
                                  fontWeight: 'bold',
                                  fontSize: '14px',
                                  marginBottom: '5px'
                                }
                              },
                              game.name || i18n.unnamedGame
                            ),
                            h(
                              'div',
                              {style: {fontSize: '13px', marginBottom: '5px'}},
                              [
                                h('span', {style: {color: '#000'}}, game.pb),
                                h('span', {style: {margin: '0 5px'}}, 'vs'),
                                h('span', {style: {color: '#666'}}, game.pw)
                              ]
                            ),
                            h(
                              'div',
                              {style: {fontSize: '12px', color: '#666'}},
                              [
                                h(
                                  'span',
                                  {},
                                  (game.moveNum ? game.moveNum : 0) + i18n.move
                                ),
                                game.liveStatus === 0
                                  ? h(
                                      'span',
                                      {
                                        style: {
                                          marginLeft: '10px',
                                          color: '#4CAF50'
                                        }
                                      },
                                      `(${i18n.live}${
                                        this.state.syncingGameId === game.id &&
                                        this.state.lastMove
                                          ? `, ${i18n.newMove}: ${this.state.lastMove}`
                                          : ''
                                      })`
                                    )
                                  : h(
                                      'span',
                                      {style: {marginLeft: '10px'}},
                                      `(${game.gameResult})`
                                    )
                              ]
                            )
                          ]
                        )
                      )
                    : h(
                        'div',
                        {
                          style: {
                            padding: '20px',
                            textAlign: 'center',
                            color: '#666'
                          }
                        },
                        i18n.noGames
                      )
                ]
              )
        ]),

        h(
          'div',
          {
            style: {
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '5px',
              justifyContent: 'space-between'
            }
          },
          [
            h(
              'button',
              {
                onClick: () => this.fetchLiveGames(),
                style: {
                  padding: '5px 10px',
                  fontSize: '14px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }
              },
              i18n.refresh
            ),

            selectedGame
              ? h(
                  'button',
                  {
                    onClick: this.state.isSyncButtonClicked
                      ? isSyncing
                        ? this.handleStopSync
                        : this.syncLiveGame
                      : this.handleSyncToBoard,
                    style: {
                      padding: '5px 10px',
                      fontSize: '14px',
                      backgroundColor: isSyncing ? '#f44336' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }
                  },
                  this.state.isSyncButtonClicked
                    ? isSyncing
                      ? i18n.stopSync
                      : i18n.startSync
                    : i18n.syncToBoard
                )
              : null
          ]
        )
      ]
    )
  }
}

module.exports = GolaxyLiveWidget
