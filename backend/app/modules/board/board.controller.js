const boardController = {};

boardController.getBoardInfo = async(req, res) => {
    const boardKey = req.params?.boardKey ?? '';

    if (!boardKey) {
        return res.status(400).json({error: '존재하지 않거나 삭제된 게시판입니다.'});
    }

    const boardModel = loadModule('board', 'model');
    const boardInfo = await boardModel.getBoard(boardKey);

    if (!boardInfo || boardInfo === {}) {
        return res.status(400).json({error: '존재하지 않거나 삭제된 게시판입니다.'});
    }

    return res.json({result: boardInfo});
}

boardController.getPostList = async(req, res) => {
    const params = {};
    params.key = req.params?.boardKey ?? '';
    params.page = req.query?.page ?? 1;
    params.page_rows = req.query?.page_rows ?? 10;
    params.searchColumn = req.query?.searchColumn ?? '';
    params.searchQuery = req.query?.searchQuery ?? '';

    const boardModel = loadModule('board', 'model');

    params.isNotice = true;
    const noticeList = await boardModel.getPost(params);

    params.isNotice = false;
    const list = await boardModel.getPost(params);

    const result = {
        result: [...noticeList.result, ...list.result],
        totalCount: list.totalCount
    }
    return res.json(result);
}

boardController.getPost = async(req, res) => {
    const postId = req.params?.postId;

    const boardModel = loadModule('board', 'model');
    const result = await boardModel.getPostOne(postId);

    if (result) {
        result.attach_list = JSON.parse(result.attach_list);
        result.is_notice = result.is_notice === 'Y';
    }
    return res.json({result});
}

module.exports = boardController;