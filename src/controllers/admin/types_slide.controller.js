const Slide = require('../../schemas/slide.schema');
const TypeSlide = require('../../schemas/type_slide.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const fileHelper = require('../../utils/transfer.util');
const filter = require('../../utils/filter.util');
const Action = require('../../models/action.enum');
const timeNow = new Date();

module.exports.list = catchAsync( async ( req, res, next ) => {
  res.status( 200 ).json( {
    message: 'Get data success!',
    data: await filter.getTypesSlide(req.user)
  } )
} )

module.exports.read = catchAsync( async ( req, res, next ) => {
  const itemId = req.params.id;
  const typeSlide = await TypeSlide.findById( itemId ).populate( 'listSlide.idSlide' );

  if ( !typeSlide ) 
    return res.status(404).json({message:'TypeSlide not found.'});

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,typeSlide);

  const result = {};
  result['name'] = typeSlide.type;
  result['listSlide'] = typeSlide.listSlide

  res.status( 200 ).json( {
    message: `Get data of ${typeSlide.type} success`,
    data: result
  } )
} )

module.exports.create = catchAsync( async ( req, res, next ) => {
  let {name,items} = {...req.body,items: JSON.parse(req.body.items)};
  const files = req.files;

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create,TypeSlide.name);
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.console.error(first),Slide.name);

  const newTypeSlide = new TypeSlide( {type: name} )
  await newTypeSlide.save();

  // ** Create new slides 
  const size = items.length;
  for( let i=0; i<size; i++ ) {
    const coordinates= []
    items[i].links.length >0 
      ? items[i].links.map(e => {coordinates.push({oxy: e.coordinates,link: e.linkImg})})
      : []

    const imageUrl = fileHelper.execImageFile( files[i],'','false' );
    const newSlide = await new Slide({
      title: items[i].title,
      description: items[i].description,
      image: imageUrl,
      coordinates: coordinates, 
      type: newTypeSlide._id,
      width: items[i].width,
      height : items[i].height
    }) 
    await newSlide.save();
    await newTypeSlide.updateOne({$push:{listSlide:{idSlide:newSlide._id}}} );
  }
  
  await new History(undefined,req.user._id,timeNow,`Thên mới Slide ${name} ở phần Sliders`).create();
  res.status( 201 ).json( {
    message: 'Add new TypeSlide success!',
    data: await filter.getTypesSlide( req.user )
  } )
} )

module.exports.update = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  let {name,items} = {...req.body,items: JSON.parse(req.body.items)};
  const files = req.files,size = items.length;
  let imgPath;

  const TypeSlideDT = await TypeSlide.findById( id ).populate( 'listSlide.idSlide' );
  if( !TypeSlideDT ) 
    return res.status(404).json({message:'TypeSlide not found.'});

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,TypeSlide.name);
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,Slide.name);

  await TypeSlideDT.updateOne({$set:{type:name,listSlide:[]}},{new:true});

  // ** Update slides
  // ** find and delete slide not in items
  let idsNew = items.map(e => e._id.toString())
  let idsOld = TypeSlideDT.listSlide.map(e => e.idSlide._id.toString())

  for(let i of TypeSlideDT.listSlide) {
    if(!idsNew.includes(i.idSlide._id.toString())) {
      const slide = await Slide.findById(i.idSlide._id);
      if(!slide)
        return next( new AppError( 'Slide not found!',422 ) );

      await slide.remove();
      await TypeSlideDT.updateOne({$pull:{listSlide:{idSlide:i.idSlide._id.toString()}}},{new:true} );
      await fileHelper.deleteFile(i.idSlide.image)
      idsOld.splice(idsOld.indexOf(i.idSlide._id.toString()), 1);
    }
  }
  // ** index of img files
  let _i = 0; 

  for(let k=0;k<size;k++) {
    // ** exec coordinates
    const coordinates= []
    items[k].links.length >0 
      ? items[k].links.map(e => {coordinates.push({oxy: e.coordinates || e.oxy ,link: e.linkImg || e.link})})
      : []

    const index = idsOld.findIndex(e => e===items[k]._id.toString())
    // ** update existing slide
    if(index >= 0) {
      items[k].upload 
        ? (imgPath = fileHelper.execImageFile( files[_i],TypeSlideDT.listSlide[index].idSlide.image,'true' )) && _i++
        : imgPath = TypeSlideDT.listSlide[index].idSlide.image
        
      const slide = await Slide.findById(idsOld[index])
      if(!slide)
        return next( new AppError( 'Slide not found!',422 ) );
      await slide.updateOne({
        $set:{
          title:items[k].title,
          description: items[k].description,
          image: imgPath,
          coordinates: coordinates, 
          type: id,
          width: items[k].width
        }},{new:true})

      await TypeSlideDT.updateOne({$push:{listSlide:{idSlide:slide._id}}},{new:true} );
    }
    else{  
      // ** create new slide
      imgPath = fileHelper.execImageFile( files[_i],'','false' )
      const newSlide = await new Slide({
        title:items[k].title,
        description: items[k].description,
        image: imgPath,
        coordinates: coordinates, 
        type: id,
        width: items[k].width
      }).save()
      _i++;
      await TypeSlideDT.updateOne({$push:{listSlide:{idSlide:newSlide._id}}},{new:true} );
    }
  }

  await new History(undefined,req.user._id,timeNow,`Cập nhật Slide ${TypeSlideDT.type} ở mục Sliders`).create();
  res.status( 200 ).json( {
    message: `Update Typeslide ${TypeSlideDT.type} success!`,
    data: await filter.getTypesSlide( req.user )
  } )   
} )

module.exports.addEffect = catchAsync(async(req,res,next) =>{
  const id = req.params.id;
  const effect = req.params.effect;

  const typeSlide = await TypeSlide.findById(id);
  if(!typeSlide) 
    return res.status(404).json({message:'TypeSlide not found.'});

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,typeSlide);

  await typeSlide.updateOne({$set:{effect:effect}},{new:true})

  await new History(undefined,req.user._id,timeNow,`Thay đổi hiệu ứng Slide ${typeSlide.type} ở mục Sliders`).create();
  res.status( 200 ).json( {
    message: 'Edit typeslide success!',
    data: await filter.getTypesSlide( req.user )
  } ) 
})

module.exports.isPost = catchAsync(async(req,res,next) =>{
  const id = req.params.id;

  if(req.query.post) {
    ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,TypeSlide);
    await TypeSlide.updateMany({},{$set:{post:0}})

    const typeSlide = await TypeSlide.findByIdAndUpdate(id,{$set:{post:req.query.post}},{new:true})
    if(!typeSlide)
      return res.status(404).json({message:'TypeSlide not found.'});
    
    await new History(undefined,req.user._id,timeNow,`Đã đăng Slide (${typeSlide.type}) ở mục Sliders`).create();
    res.status(200).json({
      message:`TypeSlide ${typeSlide.type} was posted !`,
      data:await filter.getTypesSlide( req.user )
    })
  }
})

module.exports.delete = catchAsync( async ( req, res, next ) => {
  let id = req.params.id;

  const typeSlide = await TypeSlide.findById( id );
  if ( !typeSlide ) 
    return res.status(404).json({message:'TypeSlide not found.'});
  
  for(let type of typeSlide) {
    const slide = await Slide.findById( type.idSlide );
    if(!slide)
      return res.status(404).json({message:'Slide not found.'});
  
    await slide.remove()
    await fileHelper.deleteFile(slide.image);
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,typeSlide);
  await typeSlide.remove();
  
  await new History(undefined,req.user._id,timeNow,`Xóa ${typeSlide.type} ở mục Sliders`,typeSlide).create();
  res.status( 200 ).json( {
    message: 'Delete typeslide success!',
    data: typeSlide
  } );
} )